const fs = require('fs');
const path = require('path');
const jsYaml = require('js-yaml');

const getContainerCallRef = containerCall => {
  return {
    ref: containerCall.image.ref,
    type: 'container',
  };
}

const getOpCallRef = opCall => {
  return {
    ref: opCall.pkg.ref,
    type: 'op',
  };
}

const listCallRefs = call => {
  if (call.parallel) {
    return call.parallel.reduce((refs, call) => {
      refs.push(...listCallRefs(call));
      return refs;
    }, []);
  } else if (call.serial) {
    return call.serial.reduce((refs, call) => {
      refs.push(...listCallRefs(call));
      return refs;
    }, []);
  } else if (call.op) {
    return [getOpCallRef(call.op)];
  } else if (call.container) {
    return [getContainerCallRef(call.container)];
  }
  throw new Error(`unexpected call encountered: ${JSON.stringify(call)}`);
}

const { run } = jsYaml.safeLoad(fs.readFileSync('/op.yml'));

fs.writeFileSync(
  '/refs',
  JSON.stringify(listCallRefs(run))
);