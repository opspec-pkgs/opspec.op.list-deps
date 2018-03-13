const fs = require('fs');
const path = require('path');
const jsYaml = require('js-yaml');

const getContainerCallRef = (containerCall, path) => {
  return {
    ref: containerCall.image.ref,
    path: `${path}.container.image.ref`,
  };
}

const getOpCallRef = (opCall, path) => {
  return {
    ref: opCall.pkg.ref,
    path: `${path}.op.pkg.ref`,
  };
}

const listParallelCallRefs = (parallelCall, path) => {
  return parallelCall.reduce((refs, call, index) => {
    refs.push(...listCallRefs(call, `${path}.parallel[${index}]`));
    return refs;
  }, []);
}

const listSerialCallRefs = (serialCall, path) => {
  return serialCall.reduce((refs, call, index) => {
    refs.push(...listCallRefs(call, `${path}.serial[${index}]`));
    return refs;
  }, []);
}

const listCallRefs = (call, path) => {
  if (call.parallel) {
    return listParallelCallRefs(call.parallel, path);
  } else if (call.serial) {
    return listSerialCallRefs(call.serial, path);
  } else if (call.op) {
    return [getOpCallRef(call.op, path)];
  } else if (call.container) {
    return [getContainerCallRef(call.container, path)];
  }
  throw new Error(`unexpected call encountered: ${JSON.stringify(call)}`);
}

const { run } = jsYaml.safeLoad(fs.readFileSync('/op.yml'));

fs.writeFileSync(
  '/deps',
  JSON.stringify(listCallRefs(run, 'run'))
);