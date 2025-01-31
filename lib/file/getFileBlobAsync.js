import { ENCODING, FILE_EXTENSION } from './constants';

import { wrapBlob } from './common';
import getFileExt from './getFileExt';

const ENCODING_TO_BLOB_GETTER = {
  [ENCODING.ASCII]: fileContent => Cypress.Promise.resolve(fileContent),
  [ENCODING.BASE64]: (fileContent, mimeType) => wrapBlob(Cypress.Blob.base64StringToBlob(fileContent, mimeType)),
  [ENCODING.BINARY]: (fileContent, mimeType) => wrapBlob(Cypress.Blob.binaryStringToBlob(fileContent, mimeType)),
  [ENCODING.HEX]: fileContent => Cypress.Promise.resolve(fileContent),
  [ENCODING.LATIN1]: fileContent => Cypress.Promise.resolve(fileContent),
  [ENCODING.UTF8]: fileContent => Cypress.Promise.resolve(fileContent),
  [ENCODING.UTF_8]: fileContent => Cypress.Promise.resolve(fileContent),
  [ENCODING.UCS2]: fileContent => Cypress.Promise.resolve(fileContent),
  [ENCODING.UCS_2]: fileContent => Cypress.Promise.resolve(fileContent),
  [ENCODING.UTF16LE]: fileContent => Cypress.Promise.resolve(fileContent),
  [ENCODING.UTF_16LE]: fileContent => Cypress.Promise.resolve(fileContent),
};

export default function getFileBlobAsync(
  fileName,
  fileContent,
  mimeType,
  encoding,
  window,
  lastModified,
  simulatedFilePath,
) {
  const getBlob = ENCODING_TO_BLOB_GETTER[encoding];

  return getBlob(fileContent, mimeType).then(blob => {
    let blobContent = blob;

    // https://github.com/abramenal/cypress-file-upload/issues/175
    if (getFileExt(fileName) === FILE_EXTENSION.JSON) {
      blobContent = JSON.stringify(fileContent, null, 2);
    }

    // we must use the file constructor from the subject window so this check `file instanceof File`, can pass
    const file = new window.File([blobContent], fileName, { type: mimeType, lastModified });

    if (simulatedFilePath) {
      Object.defineProperty(file, 'path', {
        get: () => simulatedFilePath,
        set: () => {},
      });
    }

    return file;
  });
}
