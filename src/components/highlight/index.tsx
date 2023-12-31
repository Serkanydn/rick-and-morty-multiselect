import { ReactElement } from "react";

type Props = {
  text: string;
  match: string;
  render(text: string, key: number | string): ReactElement;
};

const Highlight = ({ text, match, render }: Props) => {
  if (!match) {
    return text;
  }

  const regex = new RegExp(`(${match}+)`, "gi");
  const parts = text.split(regex);

  return parts.map((part: string, index: number) =>
    regex.test(part) ? render(part, index) : part
  );
};

export default Highlight;
