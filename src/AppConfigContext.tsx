import { createContext, useContext, useState, useEffect } from "react";
import { AppConfigurationClient } from "@azure/app-configuration";

interface AppConfigContextType {
  appConfigClient: AppConfigurationClient | null;
  getConfig: (key: string) => Promise<boolean | null>;
}

const AppConfigContext = createContext<AppConfigContextType>({
  appConfigClient: null,
  getConfig: async () => null, // Default implementation
});

interface AppConfigProviderProps {
  children: JSX.Element;
}

export const AppConfigProvider = ({ children }: AppConfigProviderProps) => {
  const [appConfigClient, setAppConfigClient] =
    useState<AppConfigurationClient | null>(null);

  useEffect(() => {
    const fetchAppConfigClient = async () => {
      const client = new AppConfigurationClient(
        import.meta.env.VITE_APP_CONFIG_CONNECTION_STRING
      );
      setAppConfigClient(client);
    };

    fetchAppConfigClient();
  }, []);

  const getConfig = async (key: string): Promise<boolean | null> => {
    if (!appConfigClient) return null;

    try {
      const response = await appConfigClient.getConfigurationSetting({ key });
      if (response && typeof response === "object") {
        return JSON.parse(response.value!).enabled;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching configuration:", error);
      return null;
    }
  };

  return (
    <AppConfigContext.Provider value={{ appConfigClient, getConfig }}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = (): AppConfigContextType =>
  useContext(AppConfigContext);
