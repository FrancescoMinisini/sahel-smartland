
declare module "*.csv" {
  const content: Array<{
    [key: string]: string;
  }>;
  export default content;
}
