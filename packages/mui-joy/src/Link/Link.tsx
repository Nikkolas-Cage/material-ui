import { unstable_composeClasses as composeClasses } from '@mui/base';
import { OverridableComponent } from '@mui/types';
import {
  unstable_capitalize as capitalize,
  unstable_useForkRef as useForkRef,
  unstable_useIsFocusVisible as useIsFocusVisible,
} from '@mui/utils';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import * as React from 'react';
import styled from '../styles/styled';
import useThemeProps from '../styles/useThemeProps';
import { getLinkUtilityClass } from './linkClasses';
import { LinkProps, LinkTypeMap } from './LinkProps';
import { TypographyContext } from '../Typography/Typography';

const useUtilityClasses = (ownerState: LinkProps) => {
  const { level, color, variant, underline, focusVisible, disabled } = ownerState;

  const slots = {
    root: [
      'root',
      color && `color${capitalize(color)}`,
      disabled && 'disabled',
      focusVisible && 'focusVisible',
      level,
      underline && `underline${capitalize(underline)}`,
      variant && `variant${capitalize(variant)}`,
    ],
    startDecorator: ['startDecorator'],
    endDecorator: ['endDecorator'],
  };

  return composeClasses(slots, getLinkUtilityClass, {});
};

const StartDecorator = styled('span', {
  name: 'MuiLink',
  slot: 'StartDecorator',
  overridesResolver: (props, styles) => styles.startDecorator,
})<{ ownerState: LinkProps }>({
  display: 'inline-flex',
  marginInlineEnd: 'min(var(--Link-gap, 0.25em), 0.5rem)',
});

const EndDecorator = styled('span', {
  name: 'MuiLink',
  slot: 'endDecorator',
  overridesResolver: (props, styles) => styles.endDecorator,
})<{ ownerState: LinkProps }>({
  display: 'inline-flex',
  marginInlineStart: 'min(var(--Link-gap, 0.25em), 0.5rem)',
});

const LinkRoot = styled('a', {
  name: 'MuiLink',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})<{ ownerState: LinkProps }>(({ theme, ownerState }) => {
  return [
    {
      '--Icon-fontSize': '1.25em',
      ...(ownerState.level && ownerState.level !== 'inherit' && theme.typography[ownerState.level]),
      ...(ownerState.underline === 'none' && {
        textDecoration: 'none',
      }),
      ...(ownerState.underline === 'hover' && {
        textDecoration: 'none',
        '&:hover': {
          textDecoration: 'underline',
        },
      }),
      ...(ownerState.underline === 'always' && {
        textDecoration: 'underline',
        '&:hover': {
          textDecorationColor: 'inherit',
        },
      }),
      ...(ownerState.startDecorator && {
        verticalAlign: 'bottom', // to make the link align with the parent's content
      }),
      display: 'inline-flex',
      alignItems: 'center',
      position: 'relative',
      WebkitTapHighlightColor: 'transparent',
      backgroundColor: 'transparent', // Reset default value
      // We disable the focus ring for mouse, touch and keyboard users.
      outline: 0,
      border: 0,
      margin: 0, // Remove the margin in Safari
      borderRadius: theme.vars.radius.xs,
      padding: 0, // Remove the padding in Firefox
      ...(ownerState.variant
        ? {
            paddingInline: '0.25em', // better than left, right because it also works with writing mode.
            marginInline: '-0.25em',
          }
        : {
            color: theme.vars.palette[ownerState.color!]?.textColor,
            cursor: 'pointer',
            '&.Mui-disabled': {
              pointerEvents: 'none',
              color: theme.vars.palette[ownerState.color!]?.textDisabledColor,
            },
          }),
      userSelect: 'none',
      MozAppearance: 'none', // Reset
      WebkitAppearance: 'none', // Reset
      '&::-moz-focus-inner': {
        borderStyle: 'none', // Remove Firefox dotted outline.
      },
    },
    theme.focus.default,
    ownerState.variant && theme.variants[ownerState.variant]?.[ownerState.color!],
    ownerState.variant && theme.variants[`${ownerState.variant}Hover`]?.[ownerState.color!],
    ownerState.variant && theme.variants[`${ownerState.variant}Active`]?.[ownerState.color!],
    ownerState.variant && theme.variants[`${ownerState.variant}Disabled`]?.[ownerState.color!],
  ];
});

const Link = React.forwardRef(function Link(inProps, ref) {
  const props = useThemeProps<typeof inProps & LinkProps>({
    props: inProps,
    name: 'MuiLink',
  });

  const nested = React.useContext(TypographyContext);

  const {
    className,
    color = 'primary',
    component = 'a',
    children,
    disabled = false,
    onBlur,
    onFocus,
    level: levelProp = 'body1',
    underline = 'hover',
    variant,
    endDecorator,
    startDecorator,
    ...other
  } = props;

  const level = nested ? inProps.level || 'inherit' : levelProp;

  const {
    isFocusVisibleRef,
    onBlur: handleBlurVisible,
    onFocus: handleFocusVisible,
    ref: focusVisibleRef,
  } = useIsFocusVisible();
  const [focusVisible, setFocusVisible] = React.useState<boolean>(false);
  const handleRef = useForkRef(ref, focusVisibleRef) as React.Ref<HTMLAnchorElement>;
  const handleBlur = (event: React.FocusEvent<HTMLAnchorElement>) => {
    handleBlurVisible(event);
    if (isFocusVisibleRef.current === false) {
      setFocusVisible(false);
    }
    if (onBlur) {
      onBlur(event);
    }
  };
  const handleFocus = (event: React.FocusEvent<HTMLAnchorElement>) => {
    handleFocusVisible(event);
    if (isFocusVisibleRef.current === true) {
      setFocusVisible(true);
    }
    if (onFocus) {
      onFocus(event);
    }
  };

  const ownerState = {
    ...props,
    color,
    component,
    disabled,
    focusVisible,
    underline,
    variant,
    level,
    nested,
  };

  const classes = useUtilityClasses(ownerState);

  return (
    <LinkRoot
      className={clsx(classes.root, className)}
      as={component}
      onBlur={handleBlur}
      onFocus={handleFocus}
      ref={handleRef}
      ownerState={ownerState}
      {...other}
    >
      {startDecorator && (
        <StartDecorator ownerState={ownerState} className={classes.startDecorator}>
          {startDecorator}
        </StartDecorator>
      )}

      {children}
      {endDecorator && (
        <EndDecorator ownerState={ownerState} className={classes.endDecorator}>
          {endDecorator}
        </EndDecorator>
      )}
    </LinkRoot>
  );
}) as OverridableComponent<LinkTypeMap>;

Link.propTypes /* remove-proptypes */ = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // |     To update them edit TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The color of the link.
   * @default 'primary'
   */
  color: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['context', 'danger', 'info', 'neutral', 'primary', 'success', 'warning']),
    PropTypes.string,
  ]),
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * If `true`, the component is disabled.
   * @default false
   */
  disabled: PropTypes.bool,
  /**
   * Element placed after the children.
   */
  endDecorator: PropTypes.node,
  /**
   * Applies the theme typography styles.
   * @default 'body1'
   */
  level: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['body1', 'body2', 'body3', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'inherit']),
    PropTypes.string,
  ]),
  /**
   * @ignore
   */
  onBlur: PropTypes.func,
  /**
   * @ignore
   */
  onFocus: PropTypes.func,
  /**
   * Element placed before the children.
   */
  startDecorator: PropTypes.node,
  /**
   * Controls when the link should have an underline.
   * @default 'hover'
   */
  underline: PropTypes.oneOf(['always', 'hover', 'none']),
  /**
   * Applies the theme link styles.
   * @default 'text'
   */
  variant: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['contained', 'light', 'outlined', 'text']),
    PropTypes.string,
  ]),
} as any;

export default Link;
