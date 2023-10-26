
export default class RevitalizerLayer extends PlaceablesLayer {
    constructor () {
        super()
        this.objects = {}
    }
  
    get placeables () {
        return []
    }
}