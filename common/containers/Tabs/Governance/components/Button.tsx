import React from 'react';
import classnames from 'classnames';

import { translateRaw } from 'translations';
import { NewTabLink, Tooltip } from 'components/ui';
import './Button.scss';

interface OwnProps {
  name: string;
  description?: string;
  example?: string;
  icon?: string;
  helpLink?: string;
  isSecure?: boolean;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  disableReason?: string;
  onClick: Function;
  className: string;
}

interface StateProps {
  isFormatDisabled?: boolean;
}

interface Icon {
  icon: string;
  tooltip: string;
  href?: string;
  arialabel: string;
}

type Props = OwnProps & StateProps;

export class Button extends React.PureComponent<Props> {
  public render() {
    const {
      name,
      description,
      example,
      icon,
      helpLink,
      isSecure,
      isReadOnly,
      className,
      isDisabled,
      disableReason
    } = this.props;

    const icons: Icon[] = [];
    if (helpLink) {
      icons.push({
        icon: 'question-circle',
        tooltip: translateRaw('TOOLTIP_MORE_INFO'),
        href: helpLink,
        arialabel: 'More info'
      });
    }
    let classNameObj: any = {
      Button: true,
      'Button--small': !isSecure,
      'is-disabled': isDisabled
    };
    if (className) classNameObj[className] = true;
    return (
      <div
        className={classnames(classNameObj)}
        onClick={this.handleClick}
        tabIndex={isDisabled ? -1 : 0}
        aria-disabled={isDisabled}
      >
        <div className="Button-inner">
          <div className="Button-icons">
            {icons.map(i => (
              <span className="Button-icons-icon" key={i.icon} onClick={this.stopPropogation}>
                {i.href ? (
                  <NewTabLink href={i.href} onClick={this.stopPropogation} aria-label={i.arialabel}>
                    <i className={`fa fa-${i.icon}`} />
                  </NewTabLink>
                ) : (
                  <i className={`fa fa-${i.icon}`} aria-label={i.arialabel} />
                )}
                {!isDisabled && <Tooltip size="sm">{i.tooltip}</Tooltip>}
              </span>
            ))}
          </div>
          {icon && <img className="Button-icon" src={icon} alt={name + ' logo'} />}

          <div className="Button-title">
            <span>{name}</span>
            {description && (
              <div className="Button-description" aria-label="description">
                {description}
              </div>
            )}
            {example && (
              <div className="Button-example" aria-label="example" aria-hidden={true}>
                {example}
              </div>
            )}
          </div>
        </div>

        {isDisabled && disableReason && <Tooltip>{disableReason}</Tooltip>}
      </div>
    );
  }

  private handleClick = () => {
    if (this.props.isDisabled || this.props.isFormatDisabled) {
      return;
    }

    this.props.onClick();
  };

  private stopPropogation = (ev: React.FormEvent<HTMLAnchorElement | HTMLSpanElement>) => {
    ev.stopPropagation();
  };
}
