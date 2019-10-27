
const recast = require("recast");
const PURE_REG = /\/\*#__PURE__\*\/\s*/gm;
const PURE_ANNO = '#__PURE__'

function pureanno(options) {
    return {
        name: 'rollup-pure-annotation',
        transform(code, id) {
            var transformed = false
            if ((id.endsWith('.js') || id.endsWith('.ts')) && !id.includes('Models')) {
                const hasPureAnnotation = comments => comments && comments.length === 1 && (comments[0]|| {}).value === PURE_ANNO

                const ast = recast.parse(code, {
                    parser: require("recast/parsers/babylon")
                  });

                const b = recast.types.builders;
                
                recast.visit(ast.program.body, {
                    visitExportNamedDeclaration(path) {
                        const node = path.node

                        if (node.exportKind !== 'value') {
                            return false
                        }
                        const declaration = node.declaration
                        if (!declaration || declaration.type !== 'VariableDeclaration' || declaration.kind !== 'const' || !declaration.declarations) {
                            return false
                        }

                        declaration.declarations.filter(vd => vd.init && !hasPureAnnotation(vd.init.comments)).forEach(vd => {
                            if (vd.init.type === 'CallExpression') {
                                transformed = true
                                vd.init.comments = [b.commentBlock(PURE_ANNO, true)]
                            }
                        })
                        return false
                    }
                })

                return transformed ? recast.print(ast).code : code;
            }
            return null;
        },
        generateBundle(_opts, bundles) {
            Object.values(bundles).filter(item => item.type === 'chunk').forEach(bundle => {
                bundle.code = bundle.code.replace(PURE_REG, `/*${PURE_ANNO}*/`)
            })
        }
    }
}

module.exports = pureanno