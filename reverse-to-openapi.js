'use strict'

const renderRoute = (route) => {
  return route.map(part => (typeof part === 'string') ? part : `{${part.name}}`).join('')
}

const renderParameter = (param) => ({
  name: param.name,
  in: 'path',
  // Path parameters tend to be required.
  required: true,
  schema: {
    type: 'string',
    pattern: new RegExp('^' + param.regex + '$').source
  }
})

const renderParameterRef = (param) => `#/components/parameters/${param.name}`

module.exports = function (router) {
  let paths = {}
  let parameters = {}

  router.targets.forEach(target => {
    const route = renderRoute(target.route)

    if (!paths[route]) paths[route] = {}

    paths[route][target.method.toLowerCase()] = {
      operationId: target.name,
      parameters: target.params.length ? [
        target.params.map(renderParameterRef)
      ] : undefined,
      responses: {
        default: {},
      },
    }

    target.params.forEach(param => {
      if (!parameters[param.name]) parameters[param.name] = renderParameter(param)
    })
  })

  return {
    paths,
    components: { parameters }
  }
}
