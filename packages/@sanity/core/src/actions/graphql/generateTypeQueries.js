const {upperFirst} = require('lodash')

function generateTypeQueries(types, filters) {
  const queries = []
  const queryable = types.filter(
    type => type.type === 'Object' && type.interfaces && type.interfaces.includes('Document')
  )

  // Single ID-based result lookup queries
  queryable.forEach(type => {
    queries.push({
      fieldName: type.name,
      type: type.name,
      constraints: [
        {
          field: '_id',
          comparator: 'EQUALS',
          value: {kind: 'argumentValue', argName: 'id'}
        }
      ],
      args: [
        {
          name: 'id',
          description: `${type.name} document ID`,
          type: 'ID',
          isNullable: false
        }
      ]
    })
  })

  // Fetch all of type
  queryable.forEach(type => {
    const filterName = `${type.name}Filter`
    const hasFilter = filters.find(filter => filter.name === filterName)
    queries.push({
      fieldName: `all${upperFirst(type.name)}`,
      filter: `_type == "${type.originalName || type.name}"`,
      type: {
        kind: 'List',
        isNullable: false,
        children: {type: type.name, isNullable: false}
      },
      args: hasFilter
        ? [{name: 'where', type: filterName, isFieldFilter: true}].concat(getLimitOffsetArgs())
        : getLimitOffsetArgs()
    })
  })

  return queries
}

function getLimitOffsetArgs() {
  return [
    {
      name: 'limit',
      type: 'Int',
      description: 'Max documents to return',
      isFieldFilter: false
    },
    {
      name: 'offset',
      type: 'Int',
      description: 'Offset at which to start returning documents from',
      isFieldFilter: false
    }
  ]
}

module.exports = generateTypeQueries
