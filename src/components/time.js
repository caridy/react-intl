/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import React, {Component, PropTypes} from 'react';
import {intlShape, dateTimeFormatPropTypes} from '../types';
import {invariantIntlContext, shouldIntlComponentUpdate} from '../utils';

export default class FormattedTime extends Component {
    constructor(props, context) {
        super(props, context);
        invariantIntlContext(context);
    }

    shouldComponentUpdate(...next) {
        return shouldIntlComponentUpdate(this, ...next);
    }

    render() {
        const {formatTime} = this.context.intl;
        const {value, children, style, className} = this.props;

        let formattedTime = formatTime(value, this.props);

        if (typeof children === 'function') {
            return children(formattedTime);
        }

        return <span style={style} className={className}>{formattedTime}</span>;
    }
}

FormattedTime.displayName = 'FormattedTime';

FormattedTime.contextTypes = {
    intl: intlShape,
};

FormattedTime.propTypes = {
    ...dateTimeFormatPropTypes,
    value    : PropTypes.any.isRequired,
    format   : PropTypes.string,
    children : PropTypes.func,
    style    : PropTypes.any,
    className: PropTypes.any,
};
