import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { FormControl } from '@angular/forms';
import { first, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit{
  title = 'Infinity Car Temporary Mail Solution';

  demolitions: IDemolition[] = [];
  selectedDemolition: IDemolition | null  = null;
  employeeList: string[] = [];
  selectedEmployee: string = '';

  wreckerList: { email: string, socialReason: string }[] = [];
  selectedWrecker: { email: string, socialReason: string } | null = null;

  
  wreckerControl = new FormControl('');
  employeeControl = new FormControl('');

  constructor(private httpClient: HttpClient){

  }

  ngOnInit(): void {

    this.loadDemolitions();

    this.wreckerControl.valueChanges.subscribe(
      newValue => {
        this.selectedWrecker = newValue;
        let wreckerToSelect: { email: string, socialReason: string } = this.wreckerList.find((item:any) => item.socialReason === newValue) as { email: string, socialReason: string };
        this.selectedWrecker = wreckerToSelect;
        console.log('Selected wrecker: ', this.selectedWrecker)
      }
    )

    this.employeeControl.valueChanges.subscribe(
      newValue => this.selectedEmployee = newValue
    )

    this.httpClient.get<any>(environment.baseUrl + "wrecker").pipe(first()).subscribe(
      response => this.wreckerList = response.data.wreckers
    )

    this.getEmployeeList();
  }

  loadDemolitions(){
    this.httpClient.get<any>(environment.baseUrl + 'demolitions/getAll').pipe(first()).subscribe(
      (newData: IDemolitionResponse) => {
        this.demolitions = newData.data.demolitions;
      },
      error => {
        this.demolitions = [];
      }
    )
  }

  selectDemolition(demolitionId: number){
    let demolitionToSelect = this.demolitions.find(item => item.id === demolitionId);
    if(!demolitionToSelect) return;

    this.selectedDemolition = demolitionToSelect;
  }

  assignWrecker(){
    if(!this.selectedWrecker) return;
    if(!this.selectedDemolition) return window.alert('Selezionare una pratica prima di effettuare un assegnazione!');

    this.httpClient.post(environment.baseUrl + 'demolitions/assignWrecker', {
      demolitionId: this.selectedDemolition?.id,
      socialReason: this.selectedWrecker.socialReason
    }).subscribe(
      success => {
        window.alert('Demolitore assegnato con successo!');
        this.loadDemolitions();
      },
      error => window.alert('Errore: Demolitore NON assegnato')
    )
  }


  assignOperator(){
    if(this.selectedEmployee === '') return;
    if(!this.selectedDemolition) return window.alert('Selezionare una pratica prima di effettuare un assegnazione!');

    this.httpClient.post(environment.baseUrl + 'demolitions/assignEmployee', {
      demolitionId: this.selectedDemolition?.id,
      employeeName: this.selectedEmployee
    }).subscribe(
      success => {
        window.alert('Operatore assegnato con successo!');
        this.loadDemolitions();
      },
      error => window.alert('Errore: Operatore NON assegnato')
    )
  }

  getEmployeeList(){
    this.httpClient.get<any>(environment.baseUrl + 'demolitions/employeeList').pipe(first()).subscribe(
      (response: IEmployeeResponse) => {
        this.employeeList = response.data.employee
      }
    )
  }
}

export interface IDemolition{
  emailProprietario: string;
  id: number;
  ownerName: string;
  ownerLastname: string;
  assignedTo?: string;
  wreckerSocialReason?: string;
  wreckerEmail?: string;
}

export interface IDemolitionResponse{
  success: boolean;
  message: string;
  data:{
    demolitions: IDemolition[]
  }
}

export interface IEmployeeResponse{
  data:{
    employee: string[]
  }
}
