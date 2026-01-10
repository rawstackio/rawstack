import { ValidationException } from '~/common/domain/exception/validation.exception';
import {randomUUID} from "crypto";

export class Id {
  private readonly value: string;

  constructor(id: string) {
    this.validate(id);
    this.value = id.trim();
  }

  private validate(id: string): void {
    if (!id || typeof id !== 'string') {
      throw new ValidationException('ID cannot be empty');
    }

    const trimmedId = id.trim();
    if (trimmedId.length === 0) {
      throw new ValidationException('ID cannot be empty');
    }

    // Validate UUID format (accepts any UUID version)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(trimmedId)) {
      throw new ValidationException('ID must be a valid UUID');
    }
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: Id): boolean {
    return this.value === other.value;
  }

  static create() {
    return new Id(randomUUID());
  }
}
