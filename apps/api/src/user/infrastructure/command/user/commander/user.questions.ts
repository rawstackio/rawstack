import { Question, QuestionSet } from 'nest-commander';

@QuestionSet({ name: 'create-user-questions' })
export class UserQuestions {
  @Question({
    message: 'password?',
    name: 'password',
  })
  parsePassword(val: string): string {
    return val;
  }

  @Question({
    message: 'email?',
    name: 'email',
  })
  parseEmail(val: string): string {
    return val;
  }

  @Question({
    message: 'is an admin?',
    type: 'confirm',
    name: 'isAdmin',
  })
  parseIsAdmin(val: string): string {
    return val;
  }
}
