import { useState } from "react";
import { useCookies } from "react-cookie";
import Modal from "./Modal";

export default function ListHeader({ listName, getData }) {
  const [showModal, setShowModal] = useState(false);
  const [cookie, setCookie, removeCookie] = useCookies(null);

  const signOut = () => {
    removeCookie("Email");
    removeCookie("AuthToken");
    window.location.reload();
  };

  const handleClick = () => {
    setShowModal(true);
  };

  return (
    <div className="list-header">
      <h1>{listName}</h1>
      <div className="button-container">
        <button className="create" onClick={handleClick}>
          ADD NEW
        </button>
        <button className="signout" onClick={signOut}>
          SIGN OUT
        </button>
      </div>
      {showModal && (
        <Modal mode={"create"} setShowModal={setShowModal} getData={getData} />
      )}
    </div>
  );
}
