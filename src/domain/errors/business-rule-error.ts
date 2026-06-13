import { DomainError } from './domain-error'

export class BusinessRuleError extends DomainError {
  constructor(message: string) {
    super(message)
    this.name = 'BusinessRuleError'
  }
}
