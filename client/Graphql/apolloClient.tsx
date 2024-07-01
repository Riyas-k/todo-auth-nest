"use client";
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import {
  ApolloNextAppProvider,
  NextSSRApolloClient,
  NextSSRInMemoryCache,
  SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support/ssr";
import { setContext } from "@apollo/client/link/context";

function makeClient() {
  const URL = "http://localhost:5000/graphql";

  const httpLink = new HttpLink({
    uri: URL,
  });

  const authLink = setContext((_, { headers }) => {
    // Get the authentication token from local storage if it exists
    // localStorage.getItem("token");
    const newToken = localStorage.getItem("token");
    return {
      headers: {
        ...headers,
        authorization: newToken ? `Bearer ${newToken}` : "",
      },
    };
  });

  const link = ApolloLink.from([authLink, httpLink]);

  // const client = new ApolloClient({
  //   link,
  //   cache: new InMemoryCache(),
  // });

  return new NextSSRApolloClient({
    cache: new NextSSRInMemoryCache(),
    link:
      typeof window === "undefined"
        ? ApolloLink.from([
            new SSRMultipartLink({
              stripDefer: true,
            }),
            link,
          ])
        : link,
  });
}

export function ApolloWrapper({ children }: React.PropsWithChildren<{}>) {
    
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}