module.exports = class CompositeTextDecorationLayer {
  constructor (nextScopeId) {
    this.nextScopeId = nextScopeId
    this.layerScopeIdsByCompositeScopeId = new Map()
    this.compositeScopeIdsByLayerAndScopeId = new Map()
    this.layers = []
  }

  buildIterator () {
    return new CompositeTextDecorationIterator(this)
  }

  addLayer (layer) {
    this.layers.push(layer)
  }

  removeLayer (layer) {
    // TODO: implement this.
  }

  getInvalidatedRanges () {
    return this.layers[0].getInvalidatedRanges()
  }

  onDidInvalidateRange (callback) {
    return this.layers[0].onDidInvalidateRange(callback)
  }

  classNameForScopeId (scopeId) {
    const {layer, scopeId: layerScopeId} = this.layerScopeIdsByCompositeScopeId.get(scopeId)
    return layer.classNameForScopeId(layerScopeId)
  }

  compositeScopeIdForLayerScopeId (layer, scopeId) {
    let compositeScopeIdsByLayerScopeId = this.compositeScopeIdsByLayerAndScopeId.get(layer)
    if (compositeScopeIdsByLayerScopeId == null) {
      compositeScopeIdsByLayerScopeId = new Map()
      this.compositeScopeIdsByLayerAndScopeId.set(layer, compositeScopeIdsByLayerScopeId)
    }

    let compositeScopeId = compositeScopeIdsByLayerScopeId.get(scopeId)
    if (compositeScopeId == null) {
      compositeScopeId = this.nextScopeId
      compositeScopeIdsByLayerScopeId.set(scopeId, compositeScopeId)
      this.layerScopeIdsByCompositeScopeId.set(compositeScopeId, {layer, scopeId})
      this.nextScopeId += 2
    }

    return compositeScopeId
  }
}

class CompositeTextDecorationIterator {
  constructor (compositeDecorationLayer) {
    this.compositeDecorationLayer = compositeDecorationLayer
    this.layer = this.compositeDecorationLayer.layers[0]
    this.iterator = this.layer.buildIterator()
  }

  seek (position) {
    const containingScopeIds = this.iterator.seek(position)
    return containingScopeIds.map(id => this.compositeDecorationLayer.compositeScopeIdForLayerScopeId(this.layer, id))
  }

  moveToSuccessor () {
    return this.iterator.moveToSuccessor()
  }

  getPosition () {
    return this.iterator.getPosition()
  }

  getCloseScopeIds () {
    const scopeIds = this.iterator.getCloseScopeIds()
    return scopeIds.map(id => this.compositeDecorationLayer.compositeScopeIdForLayerScopeId(this.layer, id))
  }

  getOpenScopeIds () {
    const scopeIds = this.iterator.getOpenScopeIds()
    return scopeIds.map(id => this.compositeDecorationLayer.compositeScopeIdForLayerScopeId(this.layer, id))
  }
}
