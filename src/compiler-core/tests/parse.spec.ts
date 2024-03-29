import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";
describe("Parse", () => {
  describe("interpolation", () => {
    it("simple interpolation", () => {
      const ast = baseParse("{{ message }}")
      // root
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: "message"
        }
      })
    })
  })

  describe("element", () => {
    it("simple element div", () => {
      const ast = baseParse("<div></div>")
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: "div",
        children: []
      })
    })
  })

  describe("text", () => {
    it("simple text", () => {
      const ast = baseParse("some text")
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        content: "some text"
      })
    })
  })

  test("hello world", () => {
    const ast = baseParse("<p>hi,{{message}}</p>")
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "p",
      children: [
        {
          type: NodeTypes.TEXT,
          content: "hi,"
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "message"
          }
        }
      ]
    })
  })

  test.only("Nested element", () => {
    const ast = baseParse("<div><p>hi</p>{{message}}</div>")
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "div",
      children: [
        {
          type: NodeTypes.ELEMENT,
          tag: "p",
          children: [
            {
              type: NodeTypes.TEXT,
              content: "hi"
            }
          ]
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "message"
          }
        }
      ]
    })
  })
})