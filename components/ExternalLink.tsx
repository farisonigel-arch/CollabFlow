import { Link, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';

type ExternalLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
};

export function ExternalLink(props: ExternalLinkProps) {
  const { href, onPress, ...otherProps } = props;

  return (
    <Link
      target="_blank"
      {...otherProps}
      href={href as Href}
      onPress={(event) => {
        onPress?.(event);

        if (Platform.OS !== 'web') {
          event.preventDefault();
          void WebBrowser.openBrowserAsync(href);
        }
      }}
    />
  );
}
