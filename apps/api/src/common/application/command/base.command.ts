export abstract class BaseCommand {
  public requestId?: string;

  setRequestId(requestId: string): this {
    this.requestId = requestId;
    return this;
  }
}
