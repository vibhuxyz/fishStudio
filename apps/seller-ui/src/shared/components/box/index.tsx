import styled from "styled-components";

interface BoxProps {
  css?: React.CSSProperties;
}

// ✅ CORRECT WAY 1: Using attrs without the generic type parameter in attrs
const Box = styled.div<BoxProps>`
  box-sizing: border-box;
` as any;

Box.defaultProps = {};

export default Box;
