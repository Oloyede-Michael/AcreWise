import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    // Directs operations to your active Spring Boot Netty container gateway
    uri: 'http://localhost:8080/graphql',
  }),
  cache: new InMemoryCache(), // Handles front-end cache state caching dynamically
});

export default client;