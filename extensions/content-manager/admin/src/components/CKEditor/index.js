import React from 'react';
import PropTypes from 'prop-types';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import styled from 'styled-components';
import { auth } from 'strapi-helper-plugin';

const Wrapper = styled.div`
  .ck-editor__main {
    min-height: 200px;
    > div {
      min-height: 200px;
    }
  }
`;

class UploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  async upload() {
    const body = new FormData();
    const file = await this.loader.file;
    body.append('files', file, file.name);
    body.append('fileInfo', JSON.stringify({
      alternativeText: '' ,
      caption: '',
      name: null,
    }));

    return new Promise((resolve, reject) => {
      fetch(`${strapi.backendURL}/upload`, {
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`
        },
        method: 'post',
        body
      }).then(
        r => r.json()
      ).then(res => {
        const { url, formats } = res[0];
        const formatsUrls = {
          default: url
        };

        formats.forEach(({ width, url }) => {
          formatsUrls[width] = url
        });

        resolve(formats);
      }).catch(error => {
        console.error(error);
        reject(error)
      });
    });
  }

  abort() { }
}

const Editor = ({ onChange, name, value }) => {
  return (
    <Wrapper>
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange({ target: { name, value: data } });
        }}
        onReady={(editor) => {
          editor.plugins.get('FileRepository').createUploadAdapter = (loader) => (
            new UploadAdapter(loader)
          )
        }}
      />
    </Wrapper>
  );
};

Editor.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default Editor;
