import { Navbar } from "../components/Navbar";
import { Provider } from "react-redux";
import  store  from "../store/store";

export const metadata = {
  title: "YourFoodIsGood",
  description: "Discover delicious food and recipes!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
        <Provider store={store}>
          <Navbar
            onSearch={(query: string) => {
              store.dispatch({ type: "query/setQuery", payload: query });
            }}
          />
          <main className="container mx-auto mt-4">{children}</main>
        </Provider>
  );
}
