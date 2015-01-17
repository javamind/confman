describe("Func util displayPassword ", function() {

  it("should return [0] when list is undefined", function() {
    expect(verify_code_unicity(null, 1)).toBe(0);
  });

  it("should return [0] when object is undefined", function() {
    expect(verify_code_unicity([])).toBe(0);
  });


});

/*
function verify_code_unicity(myListe, myObject) {
  return myListe.filter(
    function verify(element) {
      return element.code === myObject.code && element.id !== myObject.id;
    }
  ).length;
}
  */