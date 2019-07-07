export const uniformRandomInt = (config: {
  from?: number;
  to: number;
  inclusive?: boolean;
}) => {
  const { to, from = 0, inclusive = true } = config;
  const d = to - from + (inclusive ? 1 : 0);
  return from + Math.floor(Math.random() * d);
};

export default { uniformRandomInt };
