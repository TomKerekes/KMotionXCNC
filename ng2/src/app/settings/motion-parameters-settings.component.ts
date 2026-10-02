import { Component, Input} from '@angular/core'
import { Decimal } from 'decimal.js'
import { Machine, toInches2, toUserUnits2 } from './settings.service'

type ActuatorField = 'scale' | 'maxVel' | 'maxAccel' | 'maxJerk'

@Component({
  selector: 'motion-parameters-settings',
  templateUrl: 'motion-parameters-settings.component.html'
})
export class MotionParametersSettingsComponent {

  @Input()
  machine: Machine
  
  set cornertolerance(value:string){
    this.machine.tplanner.cornertolerance = toInches2(value, this.machine.defaultUnit)
  }
  get cornertolerance(){
    return toUserUnits2(this.machine.tplanner.cornertolerance, this.machine.defaultUnit)
  }

  set collineartolerance(value:string){
    this.machine.tplanner.collineartolerance  = toInches2(value, this.machine.defaultUnit)
  }
  get collineartolerance(){
    return toUserUnits2(this.machine.tplanner.collineartolerance, this.machine.defaultUnit)
  }

  setJogVel(value: string, axisName: string){
    this.getAxis(axisName).jogVel = toInches2(value, this.machine.defaultUnit)
  }
  getJogVel(axisName: string){
    return toUserUnits2(this.getAxis(axisName).jogVel, this.machine.defaultUnit)
  }

  setMaxVel(value: string, axisName: string){
    this.getAxis(axisName).maxVel = toInches2(value, this.machine.defaultUnit)
  }
  getMaxVel(axisName: string){
    return toUserUnits2(this.getAxis(axisName).maxVel, this.machine.defaultUnit)
  }

  setMaxAccel(value: string, axisName: string){
    this.getAxis(axisName).maxAccel = toInches2(value, this.machine.defaultUnit)
  }
  getMaxAccel(axisName: string){
    return toUserUnits2(this.getAxis(axisName).maxAccel, this.machine.defaultUnit)
  }

  setCounts(value: number, axisName: string){
    this.getAxis(axisName).countsPerUnit = toUserUnits2(value, this.machine.defaultUnit)
  }

  getCounts(axisName: string){
    return toInches2(this.getAxis(axisName).countsPerUnit, this.machine.defaultUnit)
  }

  private getAxis(name: string){
    return this.machine.axes.find(a => a.name === name)
  }

  // Actuator limits are kept in inches (per degree for rotary slots) like the axes.
  // Rotary slots show their values as stored; linear ones are converted to the display unit,
  // the scale the other way round since it is counts per unit
  getActuator(i: number, field: ActuatorField) {
    const act = this.machine.actuators[i]
    if (act.degrees) {
      return act[field]
    }
    return field === 'scale' ? toInches2(act.scale, this.machine.defaultUnit) : toUserUnits2(act[field], this.machine.defaultUnit)
  }
  setActuator(i: number, field: ActuatorField, value: string) {
    const act = this.machine.actuators[i]
    if (act.degrees) {
      act[field] = value
    } else {
      act[field] = field === 'scale' ? toUserUnits2(value, this.machine.defaultUnit) : toInches2(value, this.machine.defaultUnit)
    }
  }
  // KMotionCNC's "Copy from CAD Axes": a starting point for linear slots. The jerk starts at ten
  // times the acceleration, the value Dynomotion recommends
  copyFromAxes() {
    this.machine.axes.forEach((axis, i) => {
      if (i >= this.machine.actuators.length || !axis.countsPerUnit) {
        return
      }
      const act = this.machine.actuators[i]
      act.degrees = false
      act.scale = axis.countsPerUnit
      act.maxVel = axis.maxVel
      act.maxAccel = axis.maxAccel
      act.maxJerk = axis.maxAccel ? new Decimal(axis.maxAccel).mul(10).valueOf() : undefined
    })
  }
}
