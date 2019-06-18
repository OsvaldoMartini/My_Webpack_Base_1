class Animal {
  constructor(name, color) {
    this.name = name;
    this.color = color;
  }

  speak() {
    //console.log('Lion sark' + this.name + 'Hi ther');
    console.log(`Hi Mr ${this.name} I am ${this.color} colored Animal`);
  }
}

//let lion = new Animal('Mustafa', 'golden');

//console.log(lion);

class Lion extends Animal {
  constructor(name, color, role, home) {
    super(name, color);

    this.role = role;
    this.home = home;
  }
  roar() {
    console.log(`I am the ${this.role} of ${this.home} place`);
  }
}

let lion = new Lion('Mustafa', 'Golden', 'King', 'Pride rock');
let lion_2 = new Lion('Mustafa', 'Golden', 'King', 'Pride rock');

lion.roar();
lion.roar();
lion_2.speak();
