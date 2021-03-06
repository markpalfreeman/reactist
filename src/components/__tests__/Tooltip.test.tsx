import React from 'react'
import { shallow, mount, ShallowWrapper, ReactWrapper } from 'enzyme'

import Tooltip from '../Tooltip'

describe('Tooltip', () => {
    // Setup ==================================================================
    beforeEach(() => {
        jest.useFakeTimers()
    })
    afterEach(() => {
        jest.useRealTimers()
    })

    it('renders without crashing', () => {
        const tooltip = mount(getTooltip())
        expect(tooltip).toMatchSnapshot()
    })

    it('renders only children if text prop is not defined', () => {
        // eslint-disable-next-line
        console.error = jest.fn() // silence errors caused by unsupplied required prop
        const tooltip = shallow(getTooltip({ text: null }))
        expect(tooltip).toMatchSnapshot()
    })

    it('gets visible on hovering and hides on unhovering', () => {
        const tooltip: ShallowWrapper<Tooltip, React.ComponentState> = shallow(getTooltip())

        tooltip.simulate('mouseEnter')
        jest.runAllTimers()
        expect(tooltip.state().visible).toBe(true)

        tooltip.simulate('mouseLeave')
        jest.runAllTimers()
        expect(tooltip.state().visible).toBe(false)
    })

    describe('Arrow Placement', () => {
        it('draws a bottom arrow when rendering to the top', () => {
            const tooltip = shallow(getTooltip({ position: 'top' }))
            tooltip.simulate('mouseEnter')
            jest.runAllTimers()

            expect(tooltip.find('.arrow_bottom')).toBeTruthy()
        })

        it('draws a left arrow when rendering to the right', () => {
            const tooltip = shallow(getTooltip({ position: 'right' }))
            tooltip.simulate('mouseEnter')
            jest.runAllTimers()

            expect(tooltip.find('.arrow_left')).toBeTruthy()
        })

        it('draws a top arrow when rendering to the bottom', () => {
            const tooltip = shallow(getTooltip({ position: 'bottom' }))
            tooltip.simulate('mouseEnter')
            jest.runAllTimers()

            expect(tooltip.find('.arrow_top')).toBeTruthy()
        })

        it('draws a right arrow when rendering to the left', () => {
            const tooltip = shallow(getTooltip({ position: 'left' }))
            tooltip.simulate('mouseEnter')
            jest.runAllTimers()

            expect(tooltip.find('.arrow_right')).toBeTruthy()
        })
    })

    describe('Scroll Listener', () => {
        it('adds a capturing scrolllistener when becoming visible and when hideOnScroll is true', () => {
            document.addEventListener = jest.fn()
            const tooltip = shallow(getTooltip({ hideOnScroll: true }))

            tooltip.simulate('mouseEnter')
            jest.runAllTimers()
            const callArgs = (document.addEventListener as jest.Mock).mock.calls[0]
            expect(callArgs[0]).toBe('scroll')
            expect(callArgs[2]).toBe(true)
        })

        it('does not add a scrolllistener when becoming visible and when hideOnScroll is false', () => {
            document.addEventListener = jest.fn()
            const tooltip = shallow(getTooltip({ hideOnScroll: false }))

            tooltip.simulate('mouseEnter')
            jest.runAllTimers()
            expect(document.addEventListener).not.toHaveBeenCalled()
        })

        it('removes a capturing scrolllistener when hiding and when hideOnScroll is true', () => {
            document.removeEventListener = jest.fn()
            const tooltip = shallow(getTooltip({ hideOnScroll: true }))

            tooltip.simulate('mouseLeave')
            jest.runAllTimers()
            const callArgs = (document.removeEventListener as jest.Mock).mock.calls[0]
            expect(callArgs[0]).toBe('scroll')
            expect(callArgs[2]).toBe(true)
        })

        it('does not remove a scrolllistener when hiding and when hideOnScroll is false', () => {
            document.removeEventListener = jest.fn()
            const tooltip = shallow(getTooltip({ hideOnScroll: false }))

            tooltip.simulate('mouseLeave')
            jest.runAllTimers()
            expect(document.removeEventListener).not.toHaveBeenCalled()
        })

        it('removes scroll listener on unmount', () => {
            document.removeEventListener = jest.fn()
            const tooltip = shallow(getTooltip()).instance()

            if (tooltip.componentWillUnmount) tooltip.componentWillUnmount()
            expect(document.removeEventListener).toHaveBeenCalled()
        })
    })

    describe('Component Updates', () => {
        it('updates when the state changes', () => {
            const tooltip = shallow(getTooltip()).instance()

            const currentProps = tooltip.props
            const shouldUpdate =
                tooltip.shouldComponentUpdate &&
                tooltip.shouldComponentUpdate(
                    currentProps,
                    {
                        visible: true,
                    },
                    undefined,
                )
            expect(shouldUpdate).toBe(true)
        })

        it('updates when any property changes', () => {
            const tooltip = shallow(getTooltip()).instance()
            const currentState = tooltip.state
            const currentProps = tooltip.props

            const shouldUpdateAfterPositionChange =
                tooltip.shouldComponentUpdate &&
                tooltip.shouldComponentUpdate(
                    { ...currentProps, position: 'bottom' },
                    currentState,
                    undefined,
                )
            expect(shouldUpdateAfterPositionChange).toBe(true)

            const shouldUpdateAfterTextChange =
                tooltip.shouldComponentUpdate &&
                tooltip.shouldComponentUpdate(
                    { ...currentProps, text: 'new tip' },
                    currentState,
                    undefined,
                )
            expect(shouldUpdateAfterTextChange).toBe(true)

            const shouldUpdateAfterHideOnScrollChange =
                tooltip.shouldComponentUpdate &&
                tooltip.shouldComponentUpdate(
                    { ...currentProps, hideOnScroll: false },
                    currentState,
                    undefined,
                )
            expect(shouldUpdateAfterHideOnScrollChange).toBe(true)

            const shouldUpdateAfterDelayShowChange =
                tooltip.shouldComponentUpdate &&
                tooltip.shouldComponentUpdate(
                    { ...currentProps, delayShow: 2342 },
                    currentState,
                    undefined,
                )
            expect(shouldUpdateAfterDelayShowChange).toBe(true)

            const shouldUpdateAfterDelayHideChange =
                tooltip.shouldComponentUpdate &&
                tooltip.shouldComponentUpdate(
                    { ...currentProps, delayHide: 2342 },
                    currentState,
                    undefined,
                )
            expect(shouldUpdateAfterDelayHideChange).toBe(true)

            const shouldUpdateAfterGapSizeChange =
                tooltip.shouldComponentUpdate &&
                tooltip.shouldComponentUpdate(
                    { ...currentProps, gapSize: 10 },
                    currentState,
                    undefined,
                )
            expect(shouldUpdateAfterGapSizeChange).toBe(true)

            const shouldUpdateAfterChildrenChange =
                tooltip.shouldComponentUpdate &&
                tooltip.shouldComponentUpdate(
                    { ...currentProps, children: <span>New Content</span> },
                    currentState,
                    undefined,
                )
            expect(shouldUpdateAfterChildrenChange).toBe(true)
        })

        it('does not update when state and properties did not change', () => {
            const tooltip = shallow(getTooltip()).instance()

            const currentState = tooltip.state
            const currentProps = tooltip.props
            const shouldUpdate =
                tooltip.shouldComponentUpdate &&
                tooltip.shouldComponentUpdate(currentProps, currentState, undefined)
            expect(shouldUpdate).toBe(false)
        })
    })

    it('sets ref of tooltip and wrapper after mounting', () => {
        const tooltip: ReactWrapper<Tooltip, React.ComponentState, Tooltip> = mount(getTooltip())

        expect(tooltip.instance().wrapper).toBeTruthy()
        expect(tooltip.instance().tooltip).toBeTruthy()
    })

    it('hides when clicking on trigger', () => {
        const clickSpy = jest.fn()
        const tooltip: ReactWrapper<Tooltip, React.ComponentState, Tooltip> = mount(
            <Tooltip text="Tip">
                <span id="trigger" onClick={clickSpy}>
                    Trigger
                </span>
            </Tooltip>,
        )

        // hover an make sure tooltip is visible
        tooltip.simulate('mouseEnter')
        jest.runAllTimers()
        expect(tooltip.state().visible).toBe(true)

        // clicking the trigger
        tooltip.find('span#trigger').simulate('click')
        jest.runAllTimers()

        // making sure click is executed and tooltip hides
        expect(tooltip.state().visible).toBe(false)
        expect(clickSpy).toHaveBeenCalledTimes(1)
    })

    it('pass as children simple text', () => {
        const tooltip: ReactWrapper<Tooltip, React.ComponentState, Tooltip> = mount(
            <Tooltip text="Tip">Wrapped Text</Tooltip>,
        )
        expect(tooltip.instance().wrapper).toBeTruthy()
        expect(tooltip.instance().tooltip).toBeTruthy()
    })

    // Helpers ================================================================
    const getTooltip = (props = {}) => (
        <Tooltip text="tip" {...props}>
            <span>Wrapped Content</span>
        </Tooltip>
    )
})
