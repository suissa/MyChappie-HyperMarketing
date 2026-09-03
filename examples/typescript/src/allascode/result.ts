export interface BehaviorOk<T> {
  readonly event: "Ok";
  readonly value: T;
}

export interface BehaviorError<Code extends string> {
  readonly event: "Error";
  readonly error: {
    readonly code: Code;
    readonly message: string;
    readonly recoverable: boolean;
  };
}

export type BehaviorResult<T, Code extends string> = BehaviorOk<T> | BehaviorError<Code>;

export const ok = <T>(value: T): BehaviorOk<T> => ({ event: "Ok", value });
export const error = <Code extends string>(code: Code, message: string, recoverable = true): BehaviorError<Code> => ({
  event: "Error",
  error: { code, message, recoverable },
});
