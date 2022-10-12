import { getIntrospectionQuery, parse, print, buildClientSchema, printSchema, buildSchema, mergeTypeDefs } from './deps.ts'

async function remoteExecutor({ query, variables }, url: string) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables })
    })
    return response.json()
}

async function printRemoteSchema(executor: Function, url: string) {
    const instropection = await executor({ query: getIntrospectionQuery() }, url);
    if (instropection?.data?.__schema) {
        return printSchema(buildClientSchema(instropection.data))
    }
}

async function getResolver(schemas: string, url: string) {
    const schema = parse(schemas);
    const rootValue = {};
    for await (const objDef of schema.definitions) {
        if (objDef.name.value === 'Query' || objDef.name.value === 'Mutation') {
            for await (const funcField of objDef.fields) {
                rootValue[funcField.name.value] = async (args: any, context: any) => {
                    const { query, variables } = await context.request.clone().json();
                    const headers = await context.request.headers;
                    const response = await fetch(url, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ query, variables })
                    })
                    const json = await response.json()
                    return json.data[funcField.name.value]
                }
            }
        }
    }
    return rootValue
}

async function mergeRemoteSchema(urls: string[]) {
    const schemas: string[] = [];
    const rootValue = {};
    for await (const url of urls) {
        const schema = await printRemoteSchema(remoteExecutor, url);
        const executor = await getResolver(schema, url);
        Object.assign(rootValue, executor);
        schemas.push(schema);
    }
    const typeDefs = mergeTypeDefs(schemas);
    const schemaDefs = print(typeDefs);
    const schema = buildSchema(`
    ${schemaDefs}
    `)
    return { schema, rootValue }
}

export default async (endpoints: string[]) => {
    return await mergeRemoteSchema(endpoints);
}
