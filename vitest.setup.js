
// Mock the global game object
global.game = {
    settings: {
        get: vi.fn((_, setting) => {
            if (setting === "showStatusIcons") return true; // Enable status icons
            return false;
        }),
    }
};

// Mock the Hooks object
global.Hooks = {
    on: vi.fn(),
    once: vi.fn(),
};

// Mock the foundry object
global.foundry = {
    utils: {
        randomID: vi.fn(() => `id_${Math.random().toString(36).substring(2, 9)}`), // Generate a random ID
    },
    applications: {
        api: {
            ApplicationV2: class {
                constructor() {
                }
            },
            HandlebarsApplicationMixin: (Base) =>
                class extends Base {
                    constructor(...args) {
                        super(...args)
                    }

                    render() {
                        return true
                    }

                    close() {
                        return true
                    }
                }
        },
        handlebars: {
            renderTemplate: vi.fn(async (template, data) => {
                // For testing purposes, we can return a simple string or the data as JSON
                return `<div>${JSON.stringify(data)}</div>`;
            })
        }
    }
};
