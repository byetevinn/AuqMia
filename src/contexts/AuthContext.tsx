import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";

import api, { ICommonHeaderProperties } from "../services/api";
import { getAnimalsApi, IAnimals } from "../services/getAnimalsApi";
import { IUserData, IUserLogin, loginUsers } from "../services/loginUserApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export interface IAuthContexProps {
  children: ReactNode;
}

interface IAuthContex {
  loginUser: (data: IUserLogin) => Promise<void>;
  loginRoute: () => void;
  listAnimals: IAnimals[];
  user: IUserData;
  isLogged: boolean;
  loading: boolean;
  loginButton: boolean;
  setLoginButton: Dispatch<SetStateAction<boolean>>;
  donationButton: boolean;
  setDonationButton: Dispatch<SetStateAction<boolean>>;
  backProfile: () => void;
  adopted: boolean;
  setAdopted: Dispatch<SetStateAction<boolean>>;
  deleteAnimal: (id: string) => void;
}

export const AuthContext = createContext<IAuthContex>({} as IAuthContex);

const AuthProvider = ({ children }: IAuthContexProps) => {
  const navigate = useNavigate();
  const [listAnimals, setListAnimals] = useState([]);
  const [user, setUser] = useState<IUserData>({} as IUserData);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [loginButton, setLoginButton] = useState<boolean>(true);
  const [donationButton, setDonationButton] = useState<boolean>(true);
  const [adopted, setAdopted] = useState<boolean>(true);

  useEffect(() => {
    getAnimals();
  }, [adopted]);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("@AuqMia:token");
      if (token) {
        try {
          api.defaults.headers = {
            Authorization: `bearer ${token}`,
          } as ICommonHeaderProperties;
          setIsLogged(true);
        } catch (err) {
          console.log(err);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const loginUser = async (data: IUserLogin) => {
    loginUsers(data)
      .then((res) => {
        console.log(res);
        const { user: userReponse, accessToken } = res;
        api.defaults.headers = {
          Authorization: `bearer ${accessToken}`,
        } as ICommonHeaderProperties;
        setUser(userReponse);
        setIsLogged(true);
        toast.success("Usuário logado com sucesso!", {
          autoClose: 900,
          theme: "dark",
        });
        navigate("/profile", { replace: true });
        localStorage.setItem("@AuqMia:token", accessToken);
      })
      .catch((err) =>
        toast.error("Senha ou email incorreto", {
          autoClose: 900,
          theme: "dark",
        })
      );
  };
  const backProfile = () => {
    navigate("/dashboard");
    localStorage.removeItem("@AuqMia:token");
  };

  const loginRoute = () => {
    navigate("/login");
  };


  const getAnimals = async () => {
    await getAnimalsApi()
      .then((res) => {
        setListAnimals(res);
      })
      .catch((err) => console.log(err));
  }
  };

  const deleteAnimal = async (id: string) => {
    const token = localStorage.getItem("@AuqMia:token");

    await api.delete(`animals/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await getAnimals();
  };


  return (
    <AuthContext.Provider
      value={{
        loginUser,
        loginRoute,
        user,
        isLogged,
        loading,
        loginButton,
        setLoginButton,
        donationButton,
        setDonationButton,
        listAnimals,
        backProfile,
        adopted,
        setAdopted,
        deleteAnimal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
