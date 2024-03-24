import { useState } from "react";
import { useCookies } from "react-cookie";

export default function Modal({ mode, setShowModal, getData, task }) {
  const [cookie, setCookie, removeCookie] = useCookies(null);

  const editMmode = mode === "edit" ? true : false;

  //settiamo data come le proprietà presenti nella nostra tabella.
  const [data, setData] = useState({
    title: editMmode ? task.title : "",
    progress: editMmode ? task.progress : 50,
    date: editMmode ? "" : new Date(),
  });

  /* ------------------- POST A NEW TODO DATA TO THE SERVER  ----------------------*/
  const postData = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVERURL}/todos`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "X-Token": cookie.AuthToken 
        },
        body: JSON.stringify(data),
      });
      if (response.status === 200) {
        console.log("worked");
        setShowModal(false);
        getData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* ------------------- ENDPOINT TO UPDATE A SPECIFIC TODO ----------------------*/
  const editData = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVERURL}/todos/${task.id}`,
        {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            'X-Token': cookie.AuthToken 
          },
          body: JSON.stringify(data),
        }
      );

      if (response.status === 200) {
        setShowModal(false);
        getData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((data) => ({ ...data, [name]: value }));
  };

  return (
    <div className="overlay">
      <div className="modal">
        <div className="form-title-container">
          <h3>Let's {mode} your task</h3>
          <button onClick={() => setShowModal(false)}>X</button>
        </div>

        <form>
          <input
            required
            maxLength={30}
            placeholder="Your task goes here"
            name="title"
            value={data.title}
            onChange={handleChange}
          />
          <br />
          <label htmlFor="range"> Drag to select your current progress</label>

          <input
            id="range"
            required
            type="range"
            min="0"
            max="100"
            name="progress"
            value={data.progress}
            onChange={handleChange}
          />

          <input
            className={mode}
            type="submit"
            onClick={editMmode ? editData : postData}
          />
        </form>
      </div>
    </div>
  );
}
