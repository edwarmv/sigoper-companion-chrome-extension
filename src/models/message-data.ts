export interface MessageData<T> {
  action: string;
  status: string;
  data: T;
}
