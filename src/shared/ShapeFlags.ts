// 位运算设计shapeflags
export const enum ShapeFlags {
  ELEMENT = 1, // 0001
  SATAEFUL_COMPONENT = 1 << 1, // 0010
  TEXT_CHILDREN = 1 << 2, // 0100
  ARRAY_CHILDREN = 1 << 3 // 1000
}