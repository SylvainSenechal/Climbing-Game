using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class NewBehaviourScript : MonoBehaviour {

  void SetGameObjectPosition(float data) {
    Debug.Log("OKKKKPOURKOI");

    var position = data;
    Debug.Log(position);
    Debug.Log(position);
    Debug.Log(position);
    this.transform.position = new Vector3(data*3 , 0, 0);
    Debug.Log(position);
  }

  void SetGameObjectPosition2(string data) {
    Debug.Log("OKKKKPOURKOI");
    Debug.Log(data);
    var position = JsonUtility.FromJson<Vector3>(data);
    Debug.Log(position);
    Debug.Log(position);
    Debug.Log(position);
    this.transform.position = position;
    Debug.Log(position);
  }

  void SetLeftWrist(string data) {
    Debug.Log("Setting left Wrist");
    Debug.Log(data);
    var position = JsonUtility.FromJson<Vector3>(data);
    Debug.Log(position);
    Debug.Log(position);
    Debug.Log(position);
    this.transform.position = position;
    Debug.Log(position);
  }
}
