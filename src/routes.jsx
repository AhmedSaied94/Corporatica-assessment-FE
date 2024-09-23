import ImagePage from "./pages/Image";
import TabularDataPage from "./pages/Tabular";
import TextDataPage from "./pages/Text";
import AboutPage from "./pages/About";
import RootLayout from "./RootLayout";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RedirectToTabular = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (window.location.pathname === "/") navigate("/tabular_data");
  }, []);
  return <></>;
};

export default [
  {
    path: "",
    element: <RootLayout />,
    children: [
      {
        path: "",
        element: <RedirectToTabular />
      },
      {
        path: "tabular_data",
        element: <TabularDataPage />
      },
      {
        path: "image_data",
        element: <ImagePage />
      },
      {
        path: "text_data",
        element: <TextDataPage />
      },
      {
        path: "about",
        element: <AboutPage />
      }

    ]
  }
];
