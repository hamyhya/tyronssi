import React, { useState, useEffect } from 'react'
import styles from './styles.module.scss'
import { updateDonation } from '../../src/store/donation'
import Image from 'next/image'
import icoDown from '../../src/assets/icons/ssi_icon_3arrowsDown.svg'
import icoUp from '../../src/assets/icons/ssi_icon_3arrowsUp.svg'
import icoDown2 from '../../src/assets/icons/ssi_icon_2arrowsDown.svg'
import icoUp2 from '../../src/assets/icons/ssi_icon_2arrowsUP.svg'
import icoReceive from '../../src/assets/icons/ssi_icon_receive.svg'
import icoZap from '../../src/assets/icons/ssi_icon_thunder.svg'
import icoFire from '../../src/assets/icons/ssi_icon_fire.svg'

import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'

import { AddFunds, Balances, ClaimWallet } from '..'
import { useStore as effectorStore } from 'effector-react'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import useFetch from '../../src/hooks/fetch'
import { $doc } from '../../src/store/did-doc'
import { $net } from '../../src/store/network'
import { useStore } from 'react-stores'
import { useTranslation } from 'next-i18next'
function Component() {
    const { t } = useTranslation()
    const [active, setActive] = useState('')
    const isLight = useSelector((state: RootState) => state.modal.isLight)

    const toggleActive = (id: string) => {
        resetState()
        if (id === active) {
            setActive('')
        } else {
            setActive(id)
        }
    }
    const resetState = () => {
        updateDonation(null)
    }

    const [activeAcc, setActiveAcc] = useState('')
    const toggleActiveAcc = (id: string) => {
        if (id === activeAcc) {
            setActiveAcc('')
        } else {
            setActiveAcc(id)
        }
    }

    const { fetchDoc } = useFetch()
    const controller_ = effectorStore($doc)?.controller.toLowerCase()
    const resolvedInfo = useStore($resolvedInfo)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const zilpay_addr =
        loginInfo?.zilAddr !== null
            ? loginInfo?.zilAddr.base16.toLowerCase()
            : ''
    const net = $net.state.net as 'mainnet' | 'testnet'

    useEffect(() => {
        fetchDoc()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedInfo?.user_domain, net])

    return (
        <div className={styles.container}>
            {/* @dev: account */}
            <div className={styles.cardActiveWrapper}>
                {/* @review: tooltip */}
                {/* <div className={styles.tooltiptext}>
                    <div
                        style={{
                            fontSize: '12px',
                        }}
                    >
                        Deposit tokens
                    </div>
                </div> */}
                <div
                    onClick={() => toggleActive('account')}
                    className={
                        active === 'account' ? styles.cardActive : styles.card
                    }
                >
                    {/* @review translates */}
                    <div className={styles.icoWrapper2}>
                        <Image src={icoZap} alt="zap-ico" />
                        <div className={styles.titleX}>DIDxWALLET</div>
                    </div>
                    <div className={styles.icoWrapper}>
                        <Image
                            src={active === 'account' ? icoUp : icoDown}
                            alt="toggle-ico"
                        />
                    </div>
                </div>
                {active === 'account' && (
                    <div className={styles.cardSub}>
                        <div className={styles.wrapper}>
                            {controller_ === zilpay_addr ? (
                                <div className={styles.subWrapperBal}>
                                    <Balances />
                                </div>
                            ) : (
                                <>
                                    <div className={styles.subWrapper}>
                                        {/* @dev: deposits */}
                                        <div
                                            onClick={() =>
                                                toggleActiveAcc('receive')
                                            }
                                            className={
                                                activeAcc === 'receive'
                                                    ? styles.cardActive2
                                                    : styles.card2
                                            }
                                        >
                                            {/* @review: translates */}
                                            <div className={styles.icoWrapper2}>
                                                <Image
                                                    src={icoReceive}
                                                    alt="receive-ico"
                                                />
                                                <div className={styles.title2}>
                                                    receive
                                                </div>
                                            </div>
                                            <div className={styles.icoWrapper}>
                                                <Image
                                                    src={
                                                        activeAcc === 'receive'
                                                            ? icoUp2
                                                            : icoDown2
                                                    }
                                                    alt="toggle-ico"
                                                />
                                            </div>
                                        </div>
                                        {activeAcc === 'receive' && (
                                            <div className={styles.cardSub2}>
                                                <AddFunds type="funds" />
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.subWrapper}>
                                        <ClaimWallet title="CLAIM DIDxWALLET" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Component
