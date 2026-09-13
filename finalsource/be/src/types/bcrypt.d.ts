declare module 'bcrypt' {
  export function hash(data: string, saltOrRounds: number): Promise<string>;
}
