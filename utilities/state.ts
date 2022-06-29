export class State {
   

	static value(): StateData {
		const value = {}
		for (let key in State) 
			(value as any)[key] = (State as any)[key]
		return value;
	}
}
export type StateData = Omit<{ [key in keyof typeof State]?: (typeof State)[key] }, 'prototype' | 'value'>;

const state = State as any
for (let property in State) {
   const value = state[property]
   if (typeof value == 'function') {
      console.debug('function: ', property)
      continue;
   }
   const sub_property = `_${property}`;
   Object.defineProperty(State, sub_property, { value, writable: true })
   Object.defineProperty(State, property, {
      get() {
         if (state[sub_property] === undefined)
            state[sub_property] = JSON.parse(localStorage.getItem(property) ?? "null")
         return state[sub_property]
      },
      set(value) {
         state[sub_property] = value
         if (value == null)
            localStorage.removeItem(property)
         else
            localStorage.setItem(property, JSON.stringify(value))
      }
   });
}

export default State