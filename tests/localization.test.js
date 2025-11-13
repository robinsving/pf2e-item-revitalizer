import { describe, it, expect } from 'vitest'
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '..')

function getAllKeys(obj, prefix = '') {
    const keys = []
    for (const k of Object.keys(obj)) {
        const value = obj[k]
        const full = prefix ? `${prefix}.${k}` : k
        if (typeof value === 'object' && value !== null) {
            keys.push(...getAllKeys(value, full))
        } else {
            keys.push(full)
        }
    }
    return keys
}

function keyExists(obj, keyPath) {
    return keyPath.split('.').reduce((acc, k) => (acc && acc[k] !== undefined) ? acc[k] : undefined, obj) !== undefined
}

function collectTemplateLocalizeKeys(text) {
    const re = /\{\{\s*localize\s+["']([^"']+)["']\s*\}\}/g
    const keys = new Set()
    let m
    while ((m = re.exec(text)) !== null) keys.add(m[1])
    return [...keys]
}

function collectJsI18nKeys(text) {
    const re = /game\.i18n\.(?:localize|format)\(\s*["']([^"']+)["']/g
    const keys = new Set()
    let m
    while ((m = re.exec(text)) !== null) keys.add(m[1])
    return [...keys]
}

describe('Localization key coverage', () => {
    const enPath = path.join(root, 'lang', 'en.json')
    const enRaw = fs.readFileSync(enPath, 'utf-8')
    const en = JSON.parse(enRaw)

    it('exports a reasonable set of localization keys', () => {
        const all = getAllKeys(en)
        expect(all.length).toBeGreaterThan(10)
    })

    it('templates reference existing localization keys', () => {
        const templatesDir = path.join(root, 'templates')
        const files = fs.readdirSync(templatesDir)
        const missing = []
        for (const f of files) {
            if (!f.endsWith('.hbs')) continue
            const txt = fs.readFileSync(path.join(templatesDir, f), 'utf-8')
            const keys = collectTemplateLocalizeKeys(txt)
            for (const k of keys) {
                if (!keyExists(en, k)) missing.push({ file: f, key: k })
            }
        }
        expect(missing, `Missing localization keys referenced in templates: ${JSON.stringify(missing, null, 2)}`).toEqual([])
    })

    it('JS files reference existing localization keys', () => {
        const moduleDir = path.join(root, 'module')
        const missing = []
        function walk(dir) {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const p = path.join(dir, entry.name)
                if (entry.isDirectory()) walk(p)
                else if (entry.isFile() && entry.name.endsWith('.js')) {
                    const txt = fs.readFileSync(p, 'utf-8')
                    const keys = collectJsI18nKeys(txt)
                    for (const k of keys) if (!keyExists(en, k)) missing.push({ file: p.replace(root + path.sep, ''), key: k })
                }
            }
        }
        walk(moduleDir)
        expect(missing, `Missing localization keys referenced in JS: ${JSON.stringify(missing, null, 2)}`).toEqual([])
    })

    it('all keys in xx.json are referenced somewhere in templates or module JS', () => {
        const templateDir = path.join(root, 'templates')
        const moduleDir = path.join(root, 'module')
        const langDir = path.join(root, 'lang')

        // Build sets of keys found in templates and JS
        const templateKeys = new Set()
        for (const f of fs.readdirSync(templateDir)) {
            if (!f.endsWith('.hbs')) continue
            const txt = fs.readFileSync(path.join(templateDir, f), 'utf-8')
            for (const k of collectTemplateLocalizeKeys(txt)) templateKeys.add(k)
        }

        const jsI18nKeys = new Set()
        function walkCollect(dir) {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const p = path.join(dir, entry.name)
                if (entry.isDirectory()) walkCollect(p)
                else if (entry.isFile()) {
                    const txt = fs.readFileSync(p, 'utf-8')
                    for (const k of collectJsI18nKeys(txt)) jsI18nKeys.add(k)
                }
            }
        }
        walkCollect(moduleDir)

        // Also allow a generic substring match across template and module files for keys
        function fileContainsKey(key) {
            function searchDir(dir) {
                for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                    const p = path.join(dir, entry.name)
                    if (entry.isDirectory()) {
                        if (searchDir(p)) return true
                    } else if (entry.isFile()) {
                        const txt = fs.readFileSync(p, 'utf-8')
                        if (txt.includes(key)) return true
                    }
                }
                return false
            }
            return searchDir(templateDir) || searchDir(moduleDir)
        }

        const langFiles = fs.readdirSync(langDir).filter(f => f.endsWith('.json'))
        const errors = []

        for (const langFile of langFiles) {
            const langPath = path.join(langDir, langFile)
            const langRaw = fs.readFileSync(langPath, 'utf-8')
            const langObj = JSON.parse(langRaw)
            const allKeys = getAllKeys(langObj)
            const unused = []
            for (const key of allKeys) {
                // Consider referenced if found by localize helper, JS i18n usage, or generic substring search
                if (templateKeys.has(key) || jsI18nKeys.has(key) || fileContainsKey(key)) continue
                unused.push(key)
            }
            if (unused.length) {
                errors.push({ file: langFile, unused })
            }
        }

        expect(errors, `The following localization keys are not referenced by templates or module JS: ${JSON.stringify(errors, null, 2)}`).toEqual([])
    })

    it('other locale files mirror en.json keys (warnings only)', () => {
        const langDir = path.join(root, 'lang')
        const files = fs.readdirSync(langDir)
        const enKeys = getAllKeys(en)
        const warnings = []

        for (const f of files) {
            if (!f.endsWith('.json')) continue
            if (f === 'en.json') continue
            const p = path.join(langDir, f)
            let raw
            try {
                raw = fs.readFileSync(p, 'utf-8')
            } catch (e) {
                warnings.push({ file: f, error: `Could not read file: ${e.message}` })
                continue
            }
            let obj
            try {
                obj = JSON.parse(raw)
            } catch (e) {
                warnings.push({ file: f, error: `Invalid JSON: ${e.message}` })
                continue
            }

            const missing = []
            for (const key of enKeys) {
                if (!keyExists(obj, key)) missing.push(key)
            }
            if (missing.length) warnings.push({ file: f, missing })
        }

        if (warnings.length) {
            // Print warnings but do not fail the test suite
            console.warn('\nLocalization warnings for non-en locales:')
            for (const w of warnings) {
                if (w.error) console.warn(` - ${w.file}: ${w.error}`)
                else console.warn(` - ${w.file}: missing keys:\n    ${w.missing.join('\n    ')}`)
            }
        }

        // Always pass: this test only warns about missing translations in other locales
        expect(true).toBeTruthy()
    })
})
