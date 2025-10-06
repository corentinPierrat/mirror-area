import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = "http://10.18.207.151:8080";

export default function TestCatalog() {
  const [actions, setActions] = useState([]);
  const [reactions, setReactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [actionsRes, reactionsRes] = await Promise.all([
          axios.get(`${API_URL}/catalog/actions`),
          axios.get(`${API_URL}/catalog/reactions`)
        ]);
        console.log("Actions:", actionsRes.data);
        console.log("Reactions:", reactionsRes.data);
        setActions(actionsRes.data);
        setReactions(reactionsRes.data);
      } catch (err) {
        console.error("Erreur fetch catalog:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2>Actions</h2>
      {actions.map((a, i) => <p key={i}>{a.name || a.id}</p>)}
      <h2>Reactions</h2>
      {reactions.map((r, i) => <p key={i}>{r.name || r.id}</p>)}
    </div>
  );
}
