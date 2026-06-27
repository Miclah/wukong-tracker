interface Props {
  image: string;
}

export function FloatingSeal({ image }: Props) {
  return (
    <img
      src={image}
      alt=""
      aria-hidden="true"
      className="floating-seal"
    />
  );
}
