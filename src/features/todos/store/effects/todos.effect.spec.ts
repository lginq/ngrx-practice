import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { marbles } from 'rxjs-marbles/jest';

import { TodosEffects } from '../effects';
import * as fromActions from '../actions';
import { Todo } from '../../models/todo.model';
import { Observable } from 'rxjs';
import { TodosService } from '../../services/todos.service';
import { configureTestSuite } from '../../../../config/setupJest';

describe('TodosEffects', () => {
  let effects: TodosEffects;
  let actions: Observable<any>;
  let getTodosMock: Observable<Todo[]>;
  const t = [{ text: 'hi' }];
  const serviceMock = {
    getTodos: jest.fn(),
  };

  configureTestSuite();

  beforeAll((done) => (async () => {
    TestBed.configureTestingModule({
      providers: [
        TodosEffects,
        { provide: TodosService, useValue: serviceMock },
        provideMockActions(() => actions),
      ],
    });

    await TestBed.compileComponents();
  })().then(done).catch(done.fail));

  beforeEach(() => {
    effects = TestBed.get(TodosEffects);
  });

  describe('#loadTodos$', () => {
    it('should not duplicate server queries', marbles((m) => {
      const action = new fromActions.LoadTodosAction('hi');
      const completion = new fromActions.LoadTodosSuccessAction(t);

      actions = m.hot('aaaaa', { a: action });
      getTodosMock = m.cold('--t', { t });
      const expected = m.cold('--b', { b: completion });

      serviceMock.getTodos.mockReturnValue(getTodosMock);

      m.expect(effects.loadTodos$).toBeObservable(expected);
    }));

    it('should only query again if value has changed', marbles((m) => {
      const action = new fromActions.LoadTodosAction('hi');
      const actionB = new fromActions.LoadTodosAction('hi2');
      const completion = new fromActions.LoadTodosSuccessAction(t);

      actions = m.hot('aaaaab', { a: action, b: actionB });
      getTodosMock = m.cold('--t', { t });
      const expected = m.cold('--b----b', { b: completion });

      serviceMock.getTodos.mockReturnValue(getTodosMock);

      m.expect(effects.loadTodos$).toBeObservable(expected);
    }));

    it('should catch error after 3 tries', marbles((m) => {
      const error = 'failed!';
      const action = new fromActions.LoadTodosAction('hi');
      const completion = new fromActions.LoadTodosFailAction(error);

      actions = m.hot('a', { a: action });
      const getTodosError = m.cold('--#', {}, error);
      const expected = m.cold('------e', { e: completion });
      serviceMock.getTodos.mockReturnValue(getTodosError);

      m.expect(effects.loadTodos$).toBeObservable(expected);
    }));
  });

});
