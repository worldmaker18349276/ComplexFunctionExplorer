const PI = Math.PI;
const TAU = 2*Math.PI;

function toRPhi(x, y) {
  return [Math.sqrt(x*x+y*y), Math.atan2(y, x)];
}
function toXY(r, phi) {
  return [r*Math.cos(phi), r*Math.sin(phi)];
}
function modAround(phi, phi0) {
  var dphi = phi - phi0;
  dphi = (dphi%TAU + TAU) % TAU;
  dphi = (dphi + PI) % TAU - PI;
  return phi0 + dphi;
}
function hue2rgb(p, q, t) {
  t = (t % 1 + 1) % 1;
  if ( t < 1/6 ) return p + (q - p) * 6 * t;
  if ( t < 1/2 ) return q;
  if ( t < 2/3 ) return q + (p - q) * 6 * (t - 1/2);
                 return p;
}
function hsl2rgb(h, s, l) {
  var a = l < 0.5 ? l * s : (1 - l) * s;
  var p = l - a;
  var q = l + a;

  var r = hue2rgb(p, q, h + 1/3);
  var g = hue2rgb(p, q, h);
  var b = hue2rgb(p, q, h - 1/3);

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
function toColor(val) {
  var [r, phi] = toRPhi(...val);
  return hsl2rgb(phi/TAU, Math.tanh(r), 0.5);
}

class Expr
{
  eval(z, cache) {
    return z;
  }
}

const Z = new Expr();

class Constant extends Expr
{
  constructor(val) {
    super();
    this.val = val;
  }
  eval(z, cache) {
    return this.val;
  }
}

class Add extends Expr
{
  constructor(...exprs) {
    super();
    this.exprs = exprs;
  }
  eval(z, cache) {
    var [x, y] = [0, 0];
    for ( let expr of this.exprs ) {
      let [x_, y_] = expr.eval(z, cache);
      [x, y] = [x+x_, y+y_];
    }
    return [x, y];
  }
}

class Mul extends Expr
{
  constructor(...exprs) {
    super();
    this.exprs = exprs;
  }
  eval(z, cache) {
    var [x, y] = [1, 0];
    for ( let expr of this.exprs ) {
      let [x_, y_] = expr.eval(z, cache);
      [x, y] = [x*x_-y*y_, x*y_+y*x_];
    }
    return [x, y];
  }
}

class ConstPow extends Expr
{
  constructor(expr, pow) {
    super();
    this.expr = expr;
    this.pow = pow;
    this.tag = Symbol("ConstPow");
  }
  eval(z, cache) {
    var [x, y] = this.expr.eval(z, cache);
    var [r, phi] = toRPhi(x, y);
    if ( cache[this.tag] === undefined )
      cache[this.tag] = phi;
    var phi0 = cache[this.tag];
    phi = modAround(phi, phi0);
    cache[this.tag] = phi;
    var [r_, phi_] = [r**this.pow, phi*this.pow];
    return toXY(r_, phi_);
  }
}


class ComplexWorld
{

}