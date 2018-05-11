import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { StoreModule, Store } from "@ngrx/store";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";

import { TodosService } from "./todos.service";
import { By } from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";

describe("TodosService", () => {
  const todos = [{ text: "blah" }];
  const httpMock = {
    get: jest.fn(),
  };

  let service: TodosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TodosService,
        { provide: HttpClient, useValue: httpMock },
      ],
    });

    service = TestBed.get(TodosService);
  });

  it("should call the http client with the right URL and pipe the correct results", (done) => {
    const streamMock = Observable.of(todos);
    httpMock.get.mockReturnValue(streamMock);
    service.getTodos().subscribe(results => {
      expect(results).toEqual(todos)
      done();
    });
    expect(httpMock.get).toBeCalledWith("http://localhost:3000/todos")

  });

  it("should catch error and return empty result", (done) => {
    const errorMock = Observable.throw("error!");
    httpMock.get.mockReturnValue(errorMock);
    console.error = jest.fn();
    service.getTodos().subscribe(results => {
      expect(results).toEqual([])
      expect(console.error).toBeCalledWith("getTodos", "error!")
      done();
    });
    expect(httpMock.get).toBeCalledWith("http://localhost:3000/todos")

  });
});