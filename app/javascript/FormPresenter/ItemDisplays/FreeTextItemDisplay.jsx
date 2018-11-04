import React from 'react';
import PropTypes from 'prop-types';

import PlainTextDisplay from '../../PlainTextDisplay';
import { previewMarkdownQuery } from '../../BuiltInFormControls/MarkdownInput';
import QueryWithStateDisplay from '../../QueryWithStateDisplay';

class FreeTextItemDisplay extends React.PureComponent {
  static propTypes = {
    formItem: PropTypes.shape({
      identifier: PropTypes.string.isRequired,
      properties: PropTypes.shape({
        caption: PropTypes.string.isRequired,
        format: PropTypes.string,
      }).isRequired,
    }).isRequired,
    value: PropTypes.string,
  };

  static defaultProps = {
    value: null,
  };

  render = () => {
    const { formItem, value } = this.props;
    if (formItem.properties.format === 'markdown') {
      return (
        <QueryWithStateDisplay query={previewMarkdownQuery} variables={{ markdown: value }}>
          {({ data }) => (
            // eslint-disable-next-line react/no-danger
            <span dangerouslySetInnerHTML={{ __html: data.previewMarkdown }} />
          )}
        </QueryWithStateDisplay>
      );
    }

    return <PlainTextDisplay value={value} />;
  };
}

export default FreeTextItemDisplay;
