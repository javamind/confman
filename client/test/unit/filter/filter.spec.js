'use strict';

describe("Filter displayPassword ", function() {

  beforeEach(module('confman.filters'));

  beforeEach(inject(function($filter) {
    this.filter = $filter('displayPassword');
  }));

  it("should return param value [test] when password is undefined", function() {
    expect(this.filter('test')).toBe('test');
  });

  it("should return param value [test] when password is false", function() {
    expect(this.filter('test', false)).toBe('test');
  });

  it("should return [********] when password is true", function() {
    expect(this.filter('test', true)).toBe('********');
  });
});
