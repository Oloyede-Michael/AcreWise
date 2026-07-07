import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    // Directs operations to your active Spring Boot Netty container gateway
    uri: 'https://acrewise-9zrp.onrender.com/graphql',
  }), 
  cache: new InMemoryCache(), // Handles front-end cache state caching dynamically
});

export default client;