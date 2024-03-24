import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import ListHeader from "./components/ListHeader";
import ListItem from "./components/ListItem";
import Auth from "./components/Auth";

function App() {
  const [cookie, setCookie, removeCookie] = useCookies(null);
  const authToken = cookie.AuthToken;
  const userEmail = cookie.Email;
  const [tasks, setTasks] = useState(null);

  /* Funzione asincrona per richiede dati dal server locale,
  converte questi dati da JSON e aggiorna lo stato dell'applicazione
  */
  const getData = async () => {
    try {
      // richiesta fetch per effettuare la richiesta al server locale
      const response = await fetch(
        `${process.env.REACT_APP_SERVERURL}/todos/${userEmail}`
      );
      //json.() serve a convertire la risposta in un oggetto Javascript
      const json = await response.json();
      //per aggiornare lo stato con i dati ricevuti
      setTasks(json);
    } catch (error) {
      console.error(error);
    }
  };

  // richiamiamo la funzione assicurandoci che venga eseguita solo una volta
  useEffect(() => {
    if (authToken) {
      getData();
    }
  }, []);

  console.log("tasks:", tasks);

  //Sort task by date
  const sortedTasks = tasks?.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <>
      <div className="app">
        {!authToken && <Auth />}
        {authToken && (
          <>
            <ListHeader listName={"🏝️ Holiday tick list🏖️"} getData={getData} />
            <p className="user-email">Welcome back {userEmail}</p>
            {sortedTasks?.map((task) => (
              <ListItem key={task.id} task={task} getData={getData} />
            ))}
          </>
        )}
      </div>
    </>
  );
}

export default App;
