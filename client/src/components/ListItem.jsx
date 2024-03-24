import { useState } from "react";
import ProgressBar from "./ProgressBar";
import TickIcon from "./TickIcon";
import Modal from "./Modal";

export default function ListItem({ task, getData }) {
  const [showModal, setShowModal] = useState(false);

  /* ------------------- ENDPOINT TO DELETE A SPECIFIC TODO ----------------------*/
  const deleteItem = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVERURL}/todos/${task.id}`,
        {
          method: "DELETE",
        }
      );
      if (response.status === 200) {
        getData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <li className="list-item">
      <div className="info-container">
        <TickIcon></TickIcon>
        <p className="task-title">{task.title}</p>
        <ProgressBar progress={task.progress}></ProgressBar>
      </div>

      <div className="button-container">
        <button className="edit" onClick={() => setShowModal(true)}>
          Edit
        </button>
        <button className="delete" onClick={deleteItem}>
          Delete
        </button>
      </div>
      {showModal && (
        <Modal
          mode={"edit"}
          setShowModal={setShowModal}
          getData={getData}
          task={task}
        />
      )}
    </li>
  );
}
